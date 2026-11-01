"use client";

import { ArrowRight, Check, Info, Link as LinkIcon, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CONTROLS, OR_ROW, cq, fl, pctH, pctW, pctX, pctY, rectStyle } from "@/lib/arte-login";
import { markGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

const HINT =
  "Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador.";

const HINT_DURATION_MS = 5000;

// Área de toque de pelo menos 44 px de altura mesmo quando o controle desenhado é menor.
const TOUCH_AREA =
  "before:absolute before:inset-x-0 before:-inset-y-[max(0px,calc((44px_-_100%)/2))] before:content-['']";

const CONTROL_BASE =
  "absolute flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria";

const OR_ROW_WIDTH = OR_ROW.right.x + OR_ROW.right.w - OR_ROW.left.x;
const pctOfOrRow = (part: number) => `${((part / OR_ROW_WIDTH) * 100).toFixed(3)}%`;

export function WelcomeActions() {
  const [keepConnected, setKeepConnected] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const hintId = useId();
  const infoRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHint) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setShowHint(false);
      infoRef.current?.focus();
    }
    function closeOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;
      if (hintRef.current?.contains(target) || infoRef.current?.contains(target)) return;
      setShowHint(false);
    }
    const autoClose = setTimeout(() => setShowHint(false), HINT_DURATION_MS);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      clearTimeout(autoClose);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [showHint]);

  return (
    <>
      <Link
        href={`/entrar?manter-conectado=${keepConnected ? 1 : 0}`}
        style={{
          ...rectStyle(CONTROLS.enter),
          fontSize: fl(14, 26.1),
          gap: cq(21.7),
          paddingLeft: cq(256.3),
        }}
        className={cn(
          CONTROL_BASE,
          TOUCH_AREA,
          "justify-start bg-primaria font-bold text-texto-na-primaria hover:brightness-105",
        )}
      >
        <UserRound
          aria-hidden="true"
          strokeWidth={1.6}
          style={{ width: fl(20, 52), height: fl(20, 52) }}
        />
        Entrar
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.8}
          style={{ width: fl(20, 51), height: fl(20, 51), right: cq(36) }}
          className="absolute top-1/2 -translate-y-1/2"
        />
      </Link>
      <Link
        href="/criar-conta"
        style={{
          ...rectStyle(CONTROLS.signUp),
          fontSize: fl(14, 24.1),
          gap: cq(23.1),
          paddingLeft: cq(233.4),
          borderWidth: cq(2.5),
        }}
        className={cn(
          CONTROL_BASE,
          TOUCH_AREA,
          "justify-start border-primaria font-bold text-texto hover:bg-primaria/10",
        )}
      >
        <UserPlus
          aria-hidden="true"
          strokeWidth={1.6}
          style={{ width: fl(20, 49), height: fl(20, 49) }}
          className="text-primaria"
        />
        Criar conta
      </Link>
      <div
        style={{
          left: pctX(OR_ROW.left.x),
          width: pctW(OR_ROW_WIDTH),
          top: pctY(OR_ROW.centerY),
          fontSize: fl(12, 21.9),
        }}
        className="absolute flex -translate-y-1/2 items-center justify-between text-texto/80"
      >
        <span
          aria-hidden="true"
          style={{ width: pctOfOrRow(OR_ROW.left.w) }}
          className="h-px bg-arte-linha/60"
        />
        <p>ou</p>
        <span
          aria-hidden="true"
          style={{ width: pctOfOrRow(OR_ROW.right.w) }}
          className="h-px bg-arte-linha/60"
        />
      </div>
      <Link
        href="/"
        onClick={markGuest}
        style={{
          ...rectStyle(CONTROLS.guest),
          left: pctX(CONTROLS.guest.x + CONTROLS.guest.w / 2),
          transform: "translateX(-50%)",
          minWidth: "max-content",
          paddingInline: cq(24),
          fontSize: fl(12, 19.3),
          gap: cq(18.7),
          borderWidth: cq(1.5),
        }}
        className={cn(
          CONTROL_BASE,
          TOUCH_AREA,
          "whitespace-nowrap border-arte-borda bg-arte-vidro/80 text-texto hover:border-primaria",
        )}
      >
        <LinkIcon
          aria-hidden="true"
          strokeWidth={1.6}
          style={{ width: fl(18, 34), height: fl(18, 34) }}
        />
        Continuar como convidado
      </Link>
      <div
        style={{
          left: pctX(430.5),
          top: pctY(CONTROLS.checkbox.y),
          height: pctH(CONTROLS.checkbox.h),
          transform: "translateX(-50%)",
          fontSize: fl(12, 17.4),
          gap: cq(11),
        }}
        className="absolute flex items-center text-texto"
      >
        <label
          style={{ gap: cq(17) }}
          className="relative flex cursor-pointer items-center whitespace-nowrap before:absolute before:inset-x-0 before:-bottom-[26px] before:-top-[2px] before:content-['']"
        >
          <span
            style={{ width: fl(16, CONTROLS.checkbox.w), height: fl(16, CONTROLS.checkbox.h) }}
            className="relative block shrink-0"
          >
            <input
              type="checkbox"
              checked={keepConnected}
              onChange={(event) => setKeepConnected(event.target.checked)}
              style={{ borderRadius: cq(6), borderWidth: cq(2) }}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none border-primaria checked:bg-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            />
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="pointer-events-none absolute inset-[12%] hidden size-[76%] text-texto-na-primaria peer-checked:block"
            />
          </span>
          Manter-me conectado
        </label>
        <button
          ref={infoRef}
          type="button"
          aria-label="Saiba mais sobre Manter-me conectado"
          aria-expanded={showHint}
          aria-controls={hintId}
          onClick={() => setShowHint((shown) => !shown)}
          style={{ width: fl(16, 22), height: fl(16, 22) }}
          className="relative flex items-center justify-center rounded-full text-texto/75 transition-colors before:absolute before:-inset-[max(0px,calc((46px_-_100%)/2))] before:content-[''] hover:text-texto focus-visible:outline-2 focus-visible:outline-primaria"
        >
          <Info aria-hidden="true" className="size-full" />
        </button>
        <div
          ref={hintRef}
          id={hintId}
          aria-live="polite"
          style={{ width: cq(667) }}
          className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-campo border border-arte-borda bg-arte-vidro px-3 py-2 text-center text-xs leading-snug text-texto empty:hidden"
        >
          {showHint ? HINT : null}
        </div>
      </div>
    </>
  );
}
