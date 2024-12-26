import Dockerode from "dockerode";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export async function buildImage(path: string) {
  const stream = await docker.buildImage({
    context: path,
    src: ["Dockerfile"],
  });

  await new Promise((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (err, res) => (err ? reject(err) : resolve(res)),
      (progress) => console.log(progress)
    );
  });
}
