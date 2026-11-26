/** Segredo que a plataforma envia no cron (`Authorization: Bearer ...`); vazio recusa toda chamada. */
export const CRON_SECRET = Symbol("CRON_SECRET");
