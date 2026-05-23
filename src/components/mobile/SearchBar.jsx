function SearchBar({
  query,
  setQuery,
  handleSearch,
  loadingSearch,
}) {

  return (

    <div className="relative px-4 mt-6">

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="glass border border-cyan-500/20 rounded-xl p-3 flex items-center w-full"
      >

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar canción..."
          className="w-full bg-transparent outline-none px-3 text-sm"
        />

        <button
          type="submit"
          disabled={loadingSearch}
          className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-black"
        >
          {loadingSearch ? "..." : ">"}
        </button>

      </form>

    </div>
  )
}

export default SearchBar