module.exports = {
  apps: [
    {
      name: "crescentchange-admin",
      script: "npx",
      args: "serve -s dist -l 5174",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};