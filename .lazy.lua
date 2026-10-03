-- Project-local Neovim (AstroNvim) config for build-a-computer.
-- lazy.nvim loads this automatically when nvim is started from the repo root.
-- Mirrors .vscode/settings.json.

local root = vim.fn.getcwd()

---@type LazySpec
return {
  {
    "mrcjkb/rustaceanvim",
    -- rustaceanvim merges `vim.lsp.config["rust-analyzer"]` settings when it starts a client
    init = function()
      vim.lsp.config("rust-analyzer", {
        settings = {
          ["rust-analyzer"] = {
            linkedProjects = {
              root .. "/api_gateway/Cargo.toml",
              root .. "/authentication_microservice/Cargo.toml",
            },
            cargo = {
              features = "all",
              buildScripts = { enable = true },
              extraEnv = { DOTENV_FILE = root .. "/authentication_microservice/.env" },
            },
            procMacro = { enable = true },
          },
        },
      })
    end,
  },
}
