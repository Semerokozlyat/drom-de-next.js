'use client';  // This is a Client Component, which means you can use event listeners and hooks

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const currentPathname = usePathname();  // to read current path from browser
    const { replace } = useRouter();  // to replace current URL path in browser

    function handleSearchFunc(term: string) {
        console.log(`Searching ... ${term}`);
        const params = new URLSearchParams(searchParams);  // object for constructing the URL query params like ?page=1&query=a
        params.set('page', '1');  // reset current pagination to page 1 on search.
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${currentPathname}?${params.toString()}`);  // concatenate URL query params to the current URL path and replace it in browser
        // The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you learned about in the chapter on navigating between pages
    }
    const handleSearch = useDebouncedCallback(handleSearchFunc, 300);  // useDebouncedCallback is used to prevent sending a separate API request on each symbol typed into the search input field

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
            handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}  // keep URL in browser and search input string in sync
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
