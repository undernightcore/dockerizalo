<div align="center">
    <img alt="dockerizalo" height="200px" src="https://github.com/undernightcore/dockerizalo-ui/blob/assets/dockerizalo.png?raw=true">
</div>

# Dockerizalo

The simplest deployment platform made for self-hosters.

## Features

- Clones from any GIT compatible source, builds and deploys the image for you.
- Manage secrets, volumes, ports and more through the web UI.
- Check build and container logs in realtime.
- Made to coexist with the rest of your applications in your homelab

## Install with Docker compose

```yaml
services:
  proxy:
    image: ghcr.io/undernightcore/dockerizalo-proxy:latest
    ports:
      - "8080:8080"
    depends_on:
      - api
      - ui
  api:
    image: ghcr.io/undernightcore/dockerizalo:latest
    volumes:
      - ./apps:/data/dockerizalo
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      DATABASE_URL: postgresql://dockerizalo:dockerizalo@db:5432/dockerizalo?schema=public
      APP_SECRET: hitthekeyboardwithyourheadhere
    depends_on:
      - db
  ui:
    image: ghcr.io/undernightcore/dockerizalo-ui:latest
  db:
    image: postgres
    restart: unless-stopped
    volumes:
      - ./pg:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: dockerizalo
      POSTGRES_USER: dockerizalo
      POSTGRES_DB: dockerizalo
```

## Screenshots

![Home](https://github.com/undernightcore/dockerizalo-ui/blob/assets/home.png?raw=true)

![Builds](https://github.com/undernightcore/dockerizalo-ui/blob/assets/builds.png?raw=true)

![Ports](https://github.com/undernightcore/dockerizalo-ui/blob/assets/ports.png?raw=true)

![Tokens](https://github.com/undernightcore/dockerizalo-ui/blob/assets/tokens.png?raw=true)

## FAQ

### Does it come with an HTTPs reverse proxy?

Nope! Dockerizalo is truly made to coexist with your other apps, so it assumes you already have your own favorite proxy. Dockerizalo only deploys the apps using the port you tell him to, it is your responsibility to put a reverse proxy in front.

### Is this Docker in Docker?

Nope! If you look closely at the docker-compose.yml file for Dockerizalo it uses you Docker installation for deploying the applications.

### Where are the applications stored?

Wherever you configure in the Dockerizalo docker-compose.yml file. By default in the "apps" folder inside the same directory.

### Does it redeploy automatically after pushing to the source GIT repository?

By default, no. There is an API endpoint that builds a new version under the `POST /api/apps/{appId}/builds` route. You can configure a Webhook and call that endpoint from any service.
