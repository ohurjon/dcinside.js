import * as winston from "winston";
import { format } from "winston";

interface ILogger {
  /**에러로그 */
  error(message: string): void;
  /**경고로그 */
  warn(message: string): void;
  /**정보로그 */
  info(message: string): void;
  /**HTTP 요청 로그 */
  http(message: string): void;
  /**상세정보 로그 */
  verbose(message: string): void;
  /**디버그 로그 */
  debug(message: string): void;
  /**사소한 로그 */
  silly(message: string): void;
}

export class Logger implements ILogger {
  logger: winston.Logger;
  constructor() {
    this.logger = winston.createLogger({
      format: format.combine(
        format.label({ label: "dcinside.js" }),
        format.timestamp(),
        format.prettyPrint(),
      ),
    });
  }
  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  http(message: string): void {
    this.logger.http(message);
  }

  verbose(message: string): void {
    this.logger.verbose(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  silly(message: string): void {
    this.logger.silly(message);
  }
}
