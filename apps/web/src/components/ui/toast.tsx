export type ToastProps = {
  mensagem: string;
  acao?: { rotulo: string; aoAcionar: () => void };
  aoFechar: () => void;
  duracaoMs?: number;
};

export function Toast(props: ToastProps) {
  void props;
  return null;
}
