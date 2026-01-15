---
sidebar_position: 7
---

# Pagination

Consume Laravel's paginated responses (`LengthAwarePaginator` or `CursorPaginator`) effortlessly.

## Standard Pagination

Works with standard page number pagination (`?page=1`).

```tsx
import { useLaravelPagination } from 'next-laravel-bridge';

function BlogPosts() {
  const {
    data: posts,
    currentPage,
    lastPage,
    nextPage,
    prevPage,
    goToPage,
    isLoading
  } = useLaravelPagination({
    endpoint: '/api/posts',
    perPage: 10, // Not sending per_page param, just typing hint
  });

  return (
    <div>
      {posts.map(post => <div key={post.id}>{post.title}</div>)}

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        
        <span>Page {currentPage} of {lastPage}</span>
        
        <button onClick={nextPage} disabled={currentPage === lastPage}>
          Next
        </button>
      </div>
    </div>
  );
}
```

## Cursor Pagination

Ideal for infinite scrolling lists.

```tsx
import { useCursorPagination } from 'next-laravel-bridge';

function InfiniteTimeline() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useCursorPagination({
    endpoint: '/api/timeline',
  });

  return (
    <div>
      {data.map(item => <Item key={item.id} data={item} />)}

      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isLoading}>
          Load More
        </button>
      )}
    </div>
  );
}
```
