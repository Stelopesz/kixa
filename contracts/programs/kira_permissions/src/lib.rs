use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("2dss4aR8pXV9dJP5Y3dL2ZVcL3W4NWNynCMfLojmVPLx");

const FEE_PERMISSION_ONLY: u64 = 10_000_000;  // 0.01 SOL
const FEE_WITH_AGENT: u64 = 50_000_000;       // 0.05 SOL

#[program]
pub mod kira_permissions {
    use super::*;

    pub fn grant_permission(
        ctx: Context<GrantPermission>,
        agent_id: String,
        scope: String,
        expires_at: i64,
        is_new_agent: bool,
    ) -> Result<()> {
        let fee = if is_new_agent { FEE_WITH_AGENT } else { FEE_PERMISSION_ONLY };

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.fee_receiver.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, fee)?;

        let permission = &mut ctx.accounts.permission;
        permission.owner = ctx.accounts.owner.key();
        permission.agent_id = agent_id;
        permission.scope = scope;
        permission.expires_at = expires_at;
        permission.is_active = true;
        permission.is_new_agent = is_new_agent;
        permission.granted_at = Clock::get()?.unix_timestamp;
        msg!("Permission granted. New agent: {}. Fee: {} lamports", is_new_agent, fee);
        Ok(())
    }

    pub fn revoke_permission(ctx: Context<RevokePermission>) -> Result<()> {
        let permission = &mut ctx.accounts.permission;
        require!(permission.owner == ctx.accounts.owner.key(), KiraError::Unauthorized);
        permission.is_active = false;
        msg!("Permission revoked for agent: {}", permission.agent_id);
        Ok(())
    }

    pub fn check_permission(ctx: Context<CheckPermission>) -> Result<bool> {
        let permission = &ctx.accounts.permission;
        let clock = Clock::get()?;
        let valid = permission.is_active && permission.expires_at > clock.unix_timestamp;
        Ok(valid)
    }
}

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct GrantPermission<'info> {
    #[account(
        init,
        payer = owner,
        space = PermissionRecord::LEN,
        seeds = [b"permission", owner.key().as_ref(), agent_id.as_bytes()],
        bump
    )]
    pub permission: Account<'info, PermissionRecord>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: fee receiver
    #[account(mut)]
    pub fee_receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokePermission<'info> {
    #[account(mut, seeds = [b"permission", owner.key().as_ref(), permission.agent_id.as_bytes()], bump)]
    pub permission: Account<'info, PermissionRecord>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckPermission<'info> {
    pub permission: Account<'info, PermissionRecord>,
}

#[account]
pub struct PermissionRecord {
    pub owner: Pubkey,
    pub agent_id: String,
    pub scope: String,
    pub expires_at: i64,
    pub granted_at: i64,
    pub is_active: bool,
    pub is_new_agent: bool,
}

impl PermissionRecord {
    pub const LEN: usize = 8 + 32 + 4 + 64 + 4 + 128 + 8 + 8 + 1 + 1;
}

#[error_code]
pub enum KiraError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}
