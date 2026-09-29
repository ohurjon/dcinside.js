import axios, { AxiosInstance } from "axios";
import { Client } from "../classes/Client";

export function installErrorInterceptor(
  client: Client,
  session: AxiosInstance,
) {
  session.interceptors.response.use(
    (response) => {
      // 정상 코드
      client.emit(
        "verbose",
        `요청 : ${response.config?.method?.toUpperCase()} ${response.config?.url}`,
      );
      return response;
    },
    (error) => {
      // 2xx 범위 외의 상태 코드 및 네트워크 에러는 이 함수가 실행됩니다.
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { status } = error.response;

          // 공통 에러 분기
          switch (status) {
            case 401:
              client.emit(
                "error",
                "세션이 만료되었습니다. 다시 로그인해주세요.",
              );
              window.location.href = "/login";
              break;
            case 403:
              client.emit("error", "접근 권한이 없습니다.");
              break;
            case 500:
              client.emit("error", "디시 서버에 오류가 발생했습니다.");
              break;
            default:
              client.emit(
                "error",
                `[API Error ${status}]: "알 수 없는 오류가 발생했습니다."`,
              );
          }
        } else if (error.request) {
          // 네트워크 타임아웃 또는 서버가 죽었을 때
          if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
            if (
              error.config?.retry &&
              (error.config?.__retryAttempt || 0) < error.config.retry
            ) {
              const delay =
                (error.config.retryDelay || 1000) *
                Math.pow(2, error.config.__retryAttempt || 0);

              const jitter = delay * Math.random() * 0.3;

              client.util.sleep(delay + jitter);

              error.config.__retryAttempt =
                (error.config.__retryAttempt || 0) + 1;

              client.emit(
                "debug",
                `요청 재시도 : ${error.config?.method?.toUpperCase()} ${error.config?.url}  (${error.config.__retryAttempt || 0}/${error.config.retry}) delay: ${delay} + ${jitter}ms`,
              );
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(session.request(error.config!));
                }, delay + jitter);
              });
            } else {
              client.emit(
                "error",
                "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
              );
            }
          }
        } else {
          console.error("설정 오류:", error.message);
        }
      }

      return Promise.reject(error);
    },
  );
}
