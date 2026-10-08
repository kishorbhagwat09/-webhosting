# Deploy DeployX on AWS EC2

This guide explains how to run this repository on a single Ubuntu EC2 instance. The commands below use the repository's current `compose.yaml` and `.env.example`.

> **Important current limitation:** The DeployX web interface and API can start with Docker Compose, but deploying customer projects is not fully ready. The backend image is built from `backend/`, while deployment code looks for framework Dockerfiles in the repository-level `docker/` directory. Those templates are not copied into the image, so newly created projects can fail during deployment. Database provisioning, live terminal commands/logs, custom-domain routing, and HTTPS are also not implemented end to end. Do not treat this revision as a production hosting service for untrusted users.

## 1. What You Need

- An AWS account with permission to create EC2 instances, key pairs, and security groups.
- An Ubuntu Server 24.04 LTS EC2 instance. Recommended starting size: at least 2 vCPUs, 4 GB RAM, and 30 GB disk.
- A downloaded EC2 `.pem` key pair. AWS will not let you download it again later.
- A public IPv4 address. An Elastic IP is recommended if the address must remain stable.
- A Git repository URL for this project, or another way to transfer the source files to EC2.
- Docker Engine and the Docker Compose v2 plugin on the EC2 instance. The app itself runs in containers, so you do not need to install Python or Node.js directly on EC2.

The containers use Python 3.12 for Django, Node.js 22 to build the React frontend, and Nginx to serve the frontend. Python packages are installed from `backend/requirements.txt`; JavaScript packages are installed from `frontend/package-lock.json`.

## 2. Create the EC2 Instance

1. In AWS Console, open **EC2 → Launch instance**.
2. Choose Ubuntu Server 24.04 LTS (64-bit x86 is a suitable default) and an instance with at least 2 vCPUs and 4 GB RAM.
3. Create or select a key pair, download its `.pem` file, and keep it private.
4. Create a security group with these inbound rules:

   | Type | Port | Source | Purpose |
   | --- | ---: | --- | --- |
   | SSH | 22 | My IP only | Admin access |
   | HTTP | 80 | `0.0.0.0/0` | DeployX web interface/API |
   | Custom TCP | 8001-8998 | `0.0.0.0/0` | Direct access to deployed project containers, if used |

   Avoid opening SSH to everyone. The project containers use published host ports; only open `8001-8998` if you intend to test that workflow. This range makes those ports publicly reachable.
5. Launch the instance. In the EC2 details, copy its **Public IPv4 address**.

## 3. Connect from Windows

Open PowerShell on your Windows computer and replace the key path and IP address:

```powershell
ssh -i "$env:USERPROFILE\Downloads\deployx-key.pem" ubuntu@EC2_PUBLIC_IP
```

If SSH reports that the key permissions are too open, restrict access to the `.pem` file in Windows file properties, or use the AWS-documented Windows SSH key permission steps. Do not share or upload the private key.

## 4. Install Docker on EC2

Run these commands in the EC2 SSH session:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Disconnect and reconnect so the Docker group membership takes effect:

```bash
exit
```

Then reconnect using the SSH command above and verify:

```bash
docker --version
docker compose version
```

If your Ubuntu image does not provide `docker-compose-v2`, follow Docker's official Ubuntu installation instructions to install Docker Engine and the Compose plugin. The remaining commands use `docker compose` (with a space), not the legacy `docker-compose` command.

## 5. Upload the Project

### Recommended: clone from Git

Push the project to a Git repository first. Then, on EC2, clone it:

```bash
git clone YOUR_REPOSITORY_URL webhosting
cd webhosting
```

For a private repository, configure an SSH deploy key or another secure Git authentication method. Do not put access tokens or passwords directly in the clone URL or commit them to the repository.

### Alternative: copy files from Windows

You can use `scp` from PowerShell, but first make sure you are not copying a local `.env`, database, private key, `node_modules`, or build output. `.gitignore` does not apply to `scp`. The repository should include the root `compose.yaml`, `.env.example`, `backend/`, `frontend/`, and `docker/` paths.

## 6. Configure Environment Variables

From the repository root on EC2:

```bash
cp .env.example .env
openssl rand -hex 32
nano .env
```

Generate a private value with `openssl rand -hex 32`, then edit `.env` and set:

```dotenv
SECRET_KEY=PASTE_THE_GENERATED_RANDOM_VALUE_HERE
ALLOWED_HOSTS=EC2_PUBLIC_IP,your-domain.example
CSRF_TRUSTED_ORIGINS=http://EC2_PUBLIC_IP,http://your-domain.example
HTTP_PORT=80
```

Replace the example IP/domain with the actual values. If you do not have a domain yet, use the EC2 public IP in `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`, and remove the unused domain. `ALLOWED_HOSTS` contains hostnames/IPs only; `CSRF_TRUSTED_ORIGINS` includes the scheme (`http://`). Keep `.env` private: it is ignored by Git, and must not be committed or shared.

This repository's Compose setup is HTTP-only. Do not send real passwords or other sensitive user data over a public HTTP deployment. HTTPS requires an additional TLS proxy/load balancer and domain/certificate configuration, which this project does not currently provide.

## 7. Check and Start the App

Run these commands from the directory containing `compose.yaml`:

```bash
docker compose config
docker compose up -d --build
```

The first build can take several minutes and needs outbound internet access. Compose starts the Django backend, applies migrations, collects static files, waits for the backend health check, then starts the frontend Nginx container.

Check service status and logs:

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

Open this address in a browser:

```text
http://EC2_PUBLIC_IP/
```

Register an account to enter the DeployX dashboard. If you use a domain, point its DNS A record to the EC2 public IP and include that domain in `.env` before restarting the app. Use an Elastic IP if DNS must keep pointing to the same address after instance changes.

## 8. Updating DeployX

For a Git-based install, run this on EC2:

```bash
cd ~/webhosting
git pull
docker compose up -d --build
docker compose ps
```

The Compose named volumes preserve the SQLite database and project storage when containers are rebuilt. `docker compose down` stops/removes containers but normally keeps those volumes. **Do not run `docker compose down -v` unless you intentionally want to delete the stored database and project files.**

## 9. Back Up Persistent Data

The Compose file stores Django's SQLite database in the `deployx_data` volume and project files in `deployx_projects`. Back up both. First identify their actual names, which are prefixed by the Compose project name:

```bash
docker volume ls
```

Stop the app for a consistent SQLite backup:

```bash
docker compose stop
```

Replace the example volume names below with the names shown by `docker volume ls`. These commands create backup archives in the current directory on EC2:

```bash
docker run --rm -v webhosting_deployx_data:/source:ro -v "$PWD":/backup alpine tar czf /backup/deployx-data.tar.gz -C /source .
docker run --rm -v webhosting_deployx_projects:/source:ro -v "$PWD":/backup alpine tar czf /backup/deployx-projects.tar.gz -C /source .
docker compose start
```

Copy backups off the instance (for example, to a private S3 bucket with restricted IAM permissions). A backup stored only on the EC2 disk will be lost if that disk/instance is lost. Test restore procedures before relying on backups.

## 10. Common Problems

| Symptom | What to check |
| --- | --- |
| Compose says `Set SECRET_KEY` or `Set ALLOWED_HOSTS` | Confirm `.env` exists in the same directory as `compose.yaml` and has non-empty values. Run `docker compose config` again. |
| Port 80 is already allocated | Check whether another web server is using port 80. Stop it, or set another `HTTP_PORT` in `.env` and open that port in the EC2 security group. |
| Browser cannot connect | Confirm the instance is running, its public IP is correct, and the security group allows inbound TCP 80. Check `docker compose ps` and frontend logs. |
| `DisallowedHost` or HTTP 400 | Add the exact IP/domain used in the browser to `ALLOWED_HOSTS`, then run `docker compose up -d`. |
| Backend container is unhealthy | Inspect `docker compose logs backend`. Check `.env`, disk space, and that Docker can build the backend image. |
| Docker permission denied | Reconnect after `usermod -aG docker`; use `sudo docker ...` as a temporary admin-only check if needed. |
| New customer project deployment fails | This repository revision does not copy repository-level `docker/` templates into the backend image. The app deployment path needs a code/configuration fix before customer project deployments can be relied on. |
| Custom domain shows no HTTPS/routing | Domain routing and TLS are not configured end to end in the current Compose setup. DNS alone does not configure a reverse proxy or certificate. |

## 11. Security and Production Notes

- The backend container mounts `/var/run/docker.sock`. Access to this socket can provide host-level control. Use a dedicated EC2 instance and do not expose this setup to untrusted users.
- Restrict SSH to your IP, protect the `.pem` key and `.env`, and keep Ubuntu/Docker updated.
- The current Compose setup uses SQLite and one EC2 host. It is not a highly available or horizontally scalable production architecture.
- Do not claim MySQL databases, live terminal execution/logs, custom-domain routing, or HTTPS as available features until those parts are implemented and tested.
- Before storing real user credentials or accepting public users, configure HTTPS, harden container isolation, add tested backups/restore, and run a security review.