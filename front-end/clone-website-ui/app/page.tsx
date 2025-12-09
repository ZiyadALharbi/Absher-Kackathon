import Header from "@/components/header"
import SearchBar from "@/components/search-bar"
import MainContent from "@/components/main-content"
import RightSidebar from "@/components/right-sidebar"

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex-1">
          <SearchBar />
          <MainContent />
        </div>
        <RightSidebar />
      </div>
    </div>
  )
}
