import { type Advisory, builder } from "./builder.ts";

export const Advisories = {
  jsr: {
    hono: builder()
      .with(
        (b) =>
          b
            .withAdvisory()
            .withVulnerability({
              package: {
                ecosystem: "other",
                name: "hono",
              },
              vulnerable_version_range: ">=0.1.0",
            }),
        (b) =>
          b
            .withAdvisory()
            .withVulnerability({
              package: {
                ecosystem: "other",
                name: "http", // Sub-package
              },
              vulnerable_version_range: ">=0.1.0",
            }),
      )
      .build() as Advisory[],
    amqp: builder()
      .withAdvisory()
      .withVulnerability({
        package: {
          ecosystem: "other",
          name: "amqp",
        },
        vulnerable_version_range: ">=0.1.0",
      })
      .build() as Advisory[],
    stdCollections: builder()
      .withAdvisory()
      .withVulnerability({
        package: {
          ecosystem: "other",
          name: "@std/collections",
        },
        vulnerable_version_range: ">=0.1.0",
      })
      .build() as Advisory[],
  },
  denoland: {
    postgres: builder()
      .withAdvisory()
      .withVulnerability({
        package: {
          ecosystem: "other",
          name: "postgres",
        },
        vulnerable_version_range: ">=0.1.0",
      })
      .build() as Advisory[],
  },
  npm: {
    axios: builder()
      .withAdvisory()
      .withVulnerability({
        package: {
          ecosystem: "npm",
          name: "axios",
        },
        vulnerable_version_range: ">=0.1.0",
      })
      .build() as Advisory[],
  },
  esm: {
    echarts: builder()
      .withAdvisory()
      .withVulnerability({
        package: {
          ecosystem: "npm",
          name: "echarts",
        },
        vulnerable_version_range: ">=0.1.0",
      })
      .build() as Advisory[],
  },
};
