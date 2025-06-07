# Rust TODO Application with CI/CD Pipeline

This project demonstrates a simple command-line TODO application written in Rust with a complete CI/CD pipeline implemented using GitHub Actions.

## Features

- Basic TODO functionality: add, list, complete, and delete tasks
- Persistent JSON storage for tasks
- Containerized using Docker
- Complete CI/CD pipeline with GitHub Actions
- Kubernetes deployment using Helm charts

## Local Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (1.70 or newer)
- [Docker](https://docs.docker.com/get-docker/) (optional, for containerization)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (optional, for Kubernetes deployment)
- [Helm](https://helm.sh/docs/intro/install/) (optional, for Kubernetes deployment)

### Building the Application

1. Clone the repository:
```bash
git clone https://github.com/iam-veeramalla/rust-todo.git
cd rust-cicd-demo
```

2. Build the application:
```bash
cargo build --release
```

3. Run the application:
```bash
./target/release/rust-todo list
```

### Using the Application

The application supports the following commands:

```bash
# Add a new task
./target/release/rust-todo add "Buy groceries"

# List all tasks
./target/release/rust-todo list

# Mark a task as completed (where 1 is the task number)
./target/release/rust-todo complete 1


# Delete a task (where 1 is the task number)
./target/release/rust-todo delete 1
```

### Starting the Web Interface

To run the simple Node.js server that serves the React frontend and provides a
REST API, execute:

```bash
node server.js
```

The application will be available at `http://localhost:3000`.

### Running Tests

```bash
cargo test
```

### Running Static Analysis

```bash
# Check formatting
cargo fmt --check

# Run clippy
cargo clippy -- -D warnings
```

### Docker Build

To build and run the application in a Docker container:

```bash
# Build the Docker image
docker build -t rust-todo .

# Run the container with the list command
docker run --rm rust-todo list

# Run the container with the add command
docker run --rm rust-todo add "New task from Docker"

# Mount a volume to persist data between runs
docker run --rm -v $(pwd)/data:/app/data rust-todo list
```

## CI/CD Pipeline

The CI/CD pipeline is implemented using GitHub Actions and includes the following stages:

1. **Static Code Analysis**
   - Code formatting check (cargo fmt)
   - Linting with Clippy

2. **Build**
   - Compiles the Rust application
   - Uploads the binary artifact

3. **Unit Tests**
   - Runs all unit tests

4. **Docker Image Creation**
   - Builds a Docker image
   - Tags the image with the commit SHA
   - Saves the image for scanning

5. **Docker Image Scan**
   - Scans the Docker image for vulnerabilities using Trivy
   - Fails if critical or high vulnerabilities are found

6. **Docker Image Push**
   - Pushes the Docker image to GitHub Container Registry
   - Only runs on the main branch, not on pull requests

7. **Update Helm Values**
   - Updates the image tag in the Helm chart's values.yaml
   - Commits the changes back to the repository
   - Only runs on the main branch, not on pull requests

### Pipeline Configuration

The pipeline is configured in the [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) file.

Key points:

- The pipeline runs on pushes to the main branch and on pull requests.
- Docker images are pushed to GitHub Container Registry (GHCR).
- The image tag is generated using the commit SHA.
- Helm values are updated automatically after a successful Docker push.

## Helm Chart

The application includes a Helm chart for deployment to Kubernetes clusters. The chart is located in the `helm/rust-todo` directory.

### Deploying with Helm

```bash
# Add your GitHub Container Registry credentials to Kubernetes
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<YOUR_GITHUB_TOKEN> \
  --docker-email=<YOUR_EMAIL>

# Install the chart
helm install rust-todo ./helm/rust-todo \
  --set imagePullSecrets[0].name=ghcr-secret \
  --set image.repository=ghcr.io/<YOUR_GITHUB_USERNAME>/rust-todo
```

## License

[MIT License](LICENSE)
