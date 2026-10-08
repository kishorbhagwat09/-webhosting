import os
import re
import shutil

import docker
from django.conf import settings
from apps.projects.framework_detector import detect_framework


class DeploymentService:
    @staticmethod
    def prepare_dockerfile(project_dir, framework):
        dockerfile_path = os.path.join(project_dir, 'Dockerfile')
        if os.path.exists(dockerfile_path):
            return dockerfile_path

        template_map = {
            'static': os.path.join(settings.BASE_DIR.parent, 'docker', 'static.Dockerfile'),
            'react': os.path.join(settings.BASE_DIR.parent, 'docker', 'react.Dockerfile'),
            'node': os.path.join(settings.BASE_DIR.parent, 'docker', 'node.Dockerfile'),
            'django': os.path.join(settings.BASE_DIR.parent, 'docker', 'python.Dockerfile'),
            'flask': os.path.join(settings.BASE_DIR.parent, 'docker', 'python.Dockerfile'),
        }

        template_src = template_map.get(framework, template_map['static'])
        shutil.copy(template_src, dockerfile_path)
        return dockerfile_path

    @staticmethod
    def deploy_project(project, user):
        logs = [
            f"[DeployX] Starting deployment for project: {project.name}...",
            f"[DeployX] User: {user.username} | Framework: {project.framework}",
        ]
        project_dir = os.path.abspath(
            os.path.join(settings.PROJECTS_STORAGE_ROOT, user.username, project.name)
        )

        client = None
        try:
            detected_fw = detect_framework(project_dir)
            project.framework = detected_fw
            logs.append(f"[DeployX] Detected Framework: {detected_fw.upper()}")

            DeploymentService.prepare_dockerfile(project_dir, detected_fw)
            logs.append("[DeployX] Configured Dockerfile runner environment.")

            cpu_limit = float(project.cpu_limit)
            if cpu_limit <= 0:
                raise ValueError('CPU limit must be greater than zero.')
            nano_cpus = int(cpu_limit * 1_000_000_000)
            container_port = {
                'static': 80,
                'react': 80,
                'node': 3000,
                'django': 8000,
                'flask': 5000,
            }.get(detected_fw, 80)
            image_name = re.sub(
                r'[^a-z0-9_.-]+', '-', f'deployx-{user.username}-{project.name}'.lower()
            ).strip('-.')
            image_tag = f'{image_name}:latest'
            logs.append(f"[DeployX] Building Docker image: {image_tag}...")

            client = docker.from_env(timeout=600)
            _, build_logs = client.images.build(path=project_dir, tag=image_tag, rm=True)
            for entry in build_logs:
                if entry.get('stream'):
                    logs.extend(line for line in entry['stream'].splitlines() if line)
                if entry.get('error'):
                    raise docker.errors.DockerException(entry['error'])

            container_name = f'deployx-container-{project.id}'
            try:
                previous = client.containers.get(container_name)
                previous.stop(timeout=10)
                previous.remove()
            except docker.errors.NotFound:
                pass

            container = client.containers.run(
                image_tag,
                name=container_name,
                detach=True,
                ports={f'{container_port}/tcp': project.port},
                environment={
                    str(key): str(value)
                    for key, value in (project.env_vars or {}).items()
                },
                mem_limit=project.ram_limit,
                nano_cpus=nano_cpus,
                restart_policy={'Name': 'unless-stopped'},
            )
            project.container_id = container.id[:12]
            project.status = 'running'
            project.save(update_fields=['framework', 'container_id', 'status', 'updated_at'])
            logs.append(f"[DeployX] Container started! ID: {project.container_id} | Port: {project.port}")
            logs.append("[DeployX] Deployment successful.")
            return True, logs
        except (docker.errors.DockerException, OSError, ValueError) as error:
            project.status = 'failed'
            project.save(update_fields=['status', 'updated_at'])
            logs.append(f"[DeployX Error] Deployment failed: {error}")
            return False, logs
        finally:
            if client is not None:
                client.close()

    @staticmethod
    def container_action(project, action):
        client = docker.from_env(timeout=30)
        try:
            container = client.containers.get(f'deployx-container-{project.id}')
            if action == 'start':
                container.start()
            elif action == 'stop':
                container.stop(timeout=10)
            else:
                container.restart(timeout=10)
        finally:
            client.close()
