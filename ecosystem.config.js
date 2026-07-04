module.exports = {
  apps: [
    {
      name: "crescentchange-admin",
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 4173",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};