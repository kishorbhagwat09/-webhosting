from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import Mock, patch

import docker
from django.test import SimpleTestCase, override_settings

from .docker_service import DeploymentService


class DeploymentServiceTests(SimpleTestCase):
    def setUp(self):
        self.user = SimpleNamespace(username='test-user')

    def make_project(self):
        return SimpleNamespace(
            id=1,
            name='test-project',
            framework='static',
            status='building',
            container_id='',
            port=8001,
            cpu_limit='0.5',
            ram_limit='512M',
            env_vars={},
            save=Mock(),
        )

    @patch(
        'apps.deployment.docker_service.docker.from_env',
        side_effect=docker.errors.DockerException('Docker daemon unavailable'),
    )
    def test_deployment_reports_docker_errors_as_failures(self, _from_env):
        with TemporaryDirectory() as storage:
            project_dir = Path(storage) / self.user.username / 'test-project'
            project_dir.mkdir(parents=True)
            project = self.make_project()

            with override_settings(PROJECTS_STORAGE_ROOT=Path(storage)):
                succeeded, logs = DeploymentService.deploy_project(project, self.user)

        self.assertFalse(succeeded)
        self.assertEqual(project.status, 'failed')
        self.assertTrue(any('Docker daemon unavailable' in line for line in logs))
        self.assertFalse(any('Deployment successful' in line for line in logs))

    @patch('apps.deployment.docker_service.docker.from_env')
    def test_deployment_builds_and_starts_a_real_container(self, from_env):
        client = from_env.return_value
        client.images.build.return_value = (Mock(), iter([{'stream': 'image built\n'}]))
        client.containers.get.side_effect = docker.errors.NotFound('container not found')
        client.containers.run.return_value.id = 'abcdef123456789'
        project = self.make_project()

        with TemporaryDirectory() as storage:
            project_dir = Path(storage) / self.user.username / 'test-project'
            project_dir.mkdir(parents=True)

            with override_settings(PROJECTS_STORAGE_ROOT=Path(storage)):
                succeeded, logs = DeploymentService.deploy_project(project, self.user)

        self.assertTrue(succeeded)
        self.assertEqual(project.status, 'running')
        self.assertEqual(project.container_id, 'abcdef123456')
        self.assertTrue(any('Deployment successful' in line for line in logs))
        client.containers.run.assert_called_once()
