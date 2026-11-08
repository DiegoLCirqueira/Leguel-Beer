import type { ReactNode } from "react";

export type BottomSheetProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
};

export function BottomSheet(props: BottomSheetProps) {
  void props;
  return null;
}
