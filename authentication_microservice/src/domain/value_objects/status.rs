/// Representa o estado de suário no sistema.
#[derive(PartialEq, Clone, Copy, Debug)]
pub enum Status {
    /// Usuário ativo no sistema, realiza atividade normalmente.
    Active,
    /// Usuário inativo no sistema.
    Inactive,
    /// Usuário banido do sistema.
    Banned,
}
