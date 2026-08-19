import Header from "../components/Header.tsx";
import HomeContent from "../islands/HomeContent.tsx";

export default function Home() {

  return (
    <div>
      <Header active="home" />
      <HomeContent />
    </div>
  );
}
