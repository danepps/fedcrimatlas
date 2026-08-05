import atlasData from "./data/atlas-data.json";
import { AtlasApp } from "./atlas-app";

export default function Home() {
  return <AtlasApp data={atlasData} />;
}
