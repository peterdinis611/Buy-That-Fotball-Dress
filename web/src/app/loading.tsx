import { PitchBall } from "@/components/layout/pitch-ball";

export default function Loading() {
  return (
    <div className="kit-load" role="status" aria-label="Loading">
      <div className="kit-boot-spot">
        <PitchBall />
        <p className="kit-boot-mark">Hold the kickoff</p>
      </div>
    </div>
  );
}
