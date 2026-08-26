export default {
  apps: [{
    name: "my-rpg-bot",
    script: "./index.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_memory_restart: "300M"
  }]
};