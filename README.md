# 🚀 DeployX

> A Self-Hosted Cloud Web Hosting & Deployment Platform built with Django, React, Docker, MySQL, and Nginx.

DeployX is a full-stack cloud hosting platform that enables users to create accounts, manage projects, upload source code, edit files online with Monaco Editor, import Git repositories, deploy applications in isolated Docker containers, manage MySQL databases, and access public URLs—similar to Vercel, Netlify, or cPanel.

---

## 🎯 Main Features

- 🔑 **JWT Authentication & Profile Management**
- 📊 **Resource & Usage Monitoring Dashboard**
- 📦 **Multi-Framework Project Management** (Static HTML, React, Node.js, Django, Flask)
- 📁 **cPanel-like Path-Safe File Manager** (Create, Upload, Edit, Delete, ZIP Extract)
- 💻 **Monaco Code Editor** with syntax highlighting, auto-complete & multi-tab editing
- 🐳 **Automated Docker Deployment Engine** with CPU/RAM container limits
- 🌐 **Nginx Reverse Proxy & Custom Domain Routing**
- 🗄️ **MySQL Database Provisioning & Management**
- 📺 **Live Build Logs & Interactive Web Terminal**

---

## 🛠️ Technology Stack

- **Frontend**: React, Tailwind CSS, Vite, Monaco Editor, Axios, Lucide Icons
- **Backend**: Python, Django 5, Django REST Framework, SimpleJWT, PyMySQL, Psutil
- **Infrastructure**: Docker, Nginx, Linux Server / Windows Dev Support

---

## 📁 Repository Structure

```
deployx/
├── backend/            # Django REST API Backend
├── frontend/           # React + Vite Frontend UI
├── docker/             # Container Deployment Base Templates
├── nginx/              # Proxy Templates & Configurations
├── infrastructure/     # Infrastructure configs
├── scripts/            # Automation & Deployment Scripts
├── docs/               # System Architecture Documentation
├── deployment/         # Production deployment configs
├── monitoring/         # Server telemetry monitor scripts
└── backups/            # Database and project storage backups
```

---

## Deploy to AWS EC2

The repository includes a Docker Compose deployment for a Linux EC2 instance. The
frontend and Django API are served from one origin; the API database and uploaded
project files are stored in named Docker volumes.

1. Launch Ubuntu 24.04 on EC2 with at least 2 vCPUs, 4 GB RAM, and 30 GB disk.
   In the EC2 terminal, install the required tools:

   ```sh
   sudo apt update
   sudo apt install -y git docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker "$USER"
   ```

   Sign out and reconnect after adding your user to the Docker group.
2. In the instance security group, allow SSH (port 22) only from your IP, HTTP
   (port 80), and TCP ports **8001-8998** for deployed customer applications.
   Add HTTPS (443) only after configuring a TLS certificate and HTTPS proxy.
3. SSH into the instance, clone this repository, and enter the repository folder.
   Copy `.env.example` to `.env`, replace the example IP/domain values, and set
   `SECRET_KEY` to a private random value (for example, `openssl rand -hex 32`).
   Do not commit `.env`.
4. Start the platform with `docker compose up -d --build` and inspect startup
   with `docker compose ps` and `docker compose logs -f`.
5. Open `http://<EC2-public-IP>` and register an account. Project deployments are
   available at the instance host on the assigned port shown in the dashboard.

The backend mounts `/var/run/docker.sock` so it can build and run uploaded
applications. Access to this socket grants host-level control: use a dedicated
EC2 instance, keep SSH restricted, and do not expose this platform to untrusted
users. The supplied setup is HTTP-only; configure a domain and TLS termination
before handling real user credentials.

---

## 📄 License

MIT License © 2026 Kishor Bhagwat
