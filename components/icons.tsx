import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function makeIcon(d: string, viewBox = "0 0 24 24") {
  return function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        <path d={d} />
      </svg>
    );
  };
}

/* ---- Multi-path icons ---- */
function multiPathIcon(paths: string[], extras?: string) {
  return function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {extras && <circle cx="12" cy="12" r="3" />}
      </svg>
    );
  };
}

/* ======= Application Icons ======= */

export const IconPaw = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <ellipse cx="8" cy="6" rx="2" ry="2.5" />
    <ellipse cx="16" cy="6" rx="2" ry="2.5" />
    <ellipse cx="5" cy="11" rx="2" ry="2.5" />
    <ellipse cx="19" cy="11" rx="2" ry="2.5" />
    <path d="M12 20c-4 0-6-3-6-5s1.5-3 3-3a4 4 0 0 1 6 0c1.5 0 3 1 3 3s-2 5-6 5z" />
  </svg>
);

export const IconMail = multiPathIcon([
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
  "M22 6l-10 7L2 6"
]);

export const IconLock = multiPathIcon([
  "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z",
  "M7 11V7a5 5 0 0 1 10 0v4"
]);

export const IconEye = multiPathIcon([
  "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
], "circle");

export const IconEyeOff = multiPathIcon([
  "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94",
  "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19",
  "M14.12 14.12a3 3 0 1 1-4.24-4.24",
  "M1 1l22 22"
]);

export const IconMenu = multiPathIcon([
  "M3 12h18",
  "M3 6h18",
  "M3 18h18"
]);

export const IconX = multiPathIcon([
  "M18 6L6 18",
  "M6 6l12 12"
]);

export const IconBell = multiPathIcon([
  "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
  "M13.73 21a2 2 0 0 1-3.46 0"
]);

export const IconUser = multiPathIcon([
  "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
  "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
]);

export const IconSearch = multiPathIcon([
  "M21 21l-6-6",
  "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
]);

export const IconShield = makeIcon(
  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
);

export const IconSyringe = multiPathIcon([
  "M18 2l4 4",
  "M7.5 20.5L2 22l1.5-5.5",
  "M15 4l-8.5 8.5a2.12 2.12 0 0 0 3 3L18 7"
]);

export const IconAlertTriangle = multiPathIcon([
  "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  "M12 9v4",
  "M12 17h.01"
]);

export const IconChevronDown = makeIcon("M6 9l6 6 6-6");
export const IconChevronRight = makeIcon("M9 18l6-6-6-6");

export const IconCheck = makeIcon("M20 6L9 17l-5-5");

export const IconPlus = makeIcon("M12 5v14M5 12h14");

export const IconHome = multiPathIcon([
  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  "M9 22V12h6v10"
]);

export const IconClipboard = multiPathIcon([
  "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
  "M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
]);

export const IconSettings = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconLogOut = multiPathIcon([
  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  "M16 17l5-5-5-5",
  "M21 12H9"
]);

export const IconHelpCircle = multiPathIcon([
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
  "M12 17h.01"
]);

export const IconContrast = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
  </svg>
);

export const IconType = multiPathIcon([
  "M4 7V4h16v3",
  "M9 20h6",
  "M12 4v16"
]);

export const IconGoogle = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const IconBarangaySeal = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="7" />
    <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
    <path d="M7.76 7.76l1.41 1.41M14.83 14.83l1.41 1.41M7.76 16.24l1.41-1.41M14.83 9.17l1.41-1.41" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const IconSpinner = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="animate-spin" {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const IconMessageCircle = multiPathIcon([
  "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
]);

export const IconMic = multiPathIcon([
  "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z",
  "M19 10v2a7 7 0 0 1-14 0v-2",
  "M12 19v4",
  "M8 23h8"
]);

export const IconMicOff = multiPathIcon([
  "margin M1 1l22 22",
  "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6",
  "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23",
  "M12 19v4",
  "M8 23h8"
]);

export const IconVolume2 = multiPathIcon([
  "M11 5L6 9H2v6h4l5 4V5z",
  "M15.54 8.46a5 5 0 0 1 0 7.07",
  "M19.07 4.93a10 10 0 0 1 0 14.14"
]);

export const IconSend = multiPathIcon([
  "M22 2L11 13",
  "M22 2l-7 20-4-9-9-4 20-7z"
]);

export const IconDownload = multiPathIcon([
  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  "M7 10l5 5 5-5",
  "M12 15V3"
]);

export const IconPrinter = multiPathIcon([
  "M6 9V2h12v7",
  "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
  "M6 14h12v8H6z"
]);

export const IconQrCode = ({ size = 20, ...props }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="8" height="8" rx="1" />
    <rect x="14" y="2" width="8" height="8" rx="1" />
    <rect x="2" y="14" width="8" height="8" rx="1" />
    <path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z" />
  </svg>
);

export const IconClock = multiPathIcon([
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  "M12 6v6l4 2"
]);

export const IconFilter = multiPathIcon([
  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
]);

export const IconGlobe = multiPathIcon([
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  "M2 12h20",
  "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"
]);

export const IconSmartphone = multiPathIcon([
  "M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
  "M12 18h.01"
]);

export const IconTrash = multiPathIcon([
  "M3 6h18",
  "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  "M10 11v6",
  "M14 11v6"
]);

export const IconCamera = multiPathIcon([
  "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
  "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
]);

export const IconMonitor = multiPathIcon([
  "M2 3h20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  "M8 21h8",
  "M12 17v4"
]);

export const IconUpload = multiPathIcon([
  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  "M17 8l-5-5-5 5",
  "M12 3v12"
]);

export const IconKey = multiPathIcon([
  "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
]);

export const IconMap = multiPathIcon([
  "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z",
  "M8 2v16",
  "M16 6v16"
]);

export const IconSliders = multiPathIcon([
  "M4 21v-7",
  "M4 10V3",
  "M12 21v-9",
  "M12 8V3",
  "M20 21v-5",
  "M20 12V3",
  "M1 14h6",
  "M9 8h6",
  "M17 16h6"
]);

export const IconDatabase = multiPathIcon([
  "M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4z",
  "M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4",
  "M2 6c0 2.21 4.48 4 10 4s10-1.79 10-4"
]);

export const IconExternalLink = multiPathIcon([
  "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  "M15 3h6v6",
  "M10 14L21 3"
]);

export const IconShare2 = multiPathIcon([
  "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
  "M16 6l-4-4-4 4",
  "M12 2v13"
]);

export const IconFlag = multiPathIcon([
  "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",
  "M4 22v-7"
]);

export const IconLink2 = multiPathIcon([
  "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
  "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
]);

export const IconTrash2 = multiPathIcon([
  "M3 6h18",
  "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6",
  "M10 11v6",
  "M14 11v6"
]);

export const IconMoreVertical = multiPathIcon([
  "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  "M12 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
]);

