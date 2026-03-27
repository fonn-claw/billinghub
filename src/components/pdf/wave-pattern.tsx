import { Svg, Path } from "@react-pdf/renderer";

interface WavePatternPDFProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export function WavePatternPDF({
  width = 500,
  height = 40,
  opacity = 0.05,
}: WavePatternPDFProps) {
  const w = width;
  const h = height;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path
        d={`M0 ${h * 0.6} Q${w * 0.25} ${h * 0.2} ${w * 0.5} ${h * 0.5} T${w} ${h * 0.3}`}
        stroke="#1B6B93"
        strokeWidth={1.5}
        fill="none"
        opacity={opacity}
      />
      <Path
        d={`M0 ${h * 0.8} Q${w * 0.25} ${h * 0.4} ${w * 0.5} ${h * 0.7} T${w} ${h * 0.5}`}
        stroke="#0C2D48"
        strokeWidth={1.5}
        fill="none"
        opacity={opacity}
      />
    </Svg>
  );
}
