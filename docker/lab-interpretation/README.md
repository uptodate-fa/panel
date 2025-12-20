# Lab Interpretation Docker Deployment

This directory contains the Docker configuration for deploying the Lab Interpretation static site.

## Building the Docker Image

From the project root directory:

```bash
docker build -f docker/lab-interpretation/Dockerfile -t lab-interpretation:latest .
```

## Running the Container

```bash
docker run -d -p 8080:80 --name lab-interpretation lab-interpretation:latest
```

The application will be available at `http://localhost:8080`

## Using the Build Script

```bash
# Make the script executable (if not already)
chmod +x docker/lab-interpretation/build.sh

# Run the build script
./docker/lab-interpretation/build.sh
```

## Container Management

```bash
# View logs
docker logs -f lab-interpretation

# Stop the container
docker stop lab-interpretation

# Start the container
docker start lab-interpretation

# Remove the container
docker rm lab-interpretation
```

## Features

- **Lightweight**: Uses nginx:alpine for a minimal container size
- **Performance**: Gzip compression enabled for better load times
- **Security**: Security headers configured (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- **Caching**: Static assets (images, fonts, CSS) cached for 1 year
- **Fresh Content**: HTML files are not cached to ensure latest content

## Configuration

### Nginx Configuration

The nginx configuration is located at `docker/lab-interpretation/nginx.conf`. Key features:

- Gzip compression for text-based files
- Static asset caching (1 year)
- HTML files served without cache
- 404 errors redirect to index.html

### Port Configuration

Default port is `8080` (mapped to container port `80`). To change the port:

```bash
docker run -d -p YOUR_PORT:80 --name lab-interpretation lab-interpretation:latest
```

## Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (e.g., Traefik, nginx, or cloud load balancer)
2. **Enable HTTPS** using Let's Encrypt or your SSL certificate
3. **Set up monitoring** and logging
4. **Use environment-specific configurations**


## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs lab-interpretation

# Verify nginx config
docker exec lab-interpretation nginx -t
```

### Files not loading
- Verify the files are copied correctly: `docker exec lab-interpretation ls -la /usr/share/nginx/html`
- Check nginx error logs: `docker exec lab-interpretation cat /var/log/nginx/error.log`

### Permission issues
- Ensure the nginx user has read access to files
- Check file permissions in the source directory

## Customization

To modify the nginx configuration:
1. Edit `docker/lab-interpretation/nginx.conf`
2. Rebuild the image: `docker build -f docker/lab-interpretation/Dockerfile -t lab-interpretation:latest .`
3. Restart the container: `docker restart lab-interpretation`

