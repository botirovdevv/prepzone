import { Composition, registerRoot } from "remotion";
import { Reel } from "./Reel";

const Root = () => (
  <Composition id="PrepzoneReel" component={Reel} durationInFrames={450} fps={30} width={1080} height={1920} />
);

registerRoot(Root);
