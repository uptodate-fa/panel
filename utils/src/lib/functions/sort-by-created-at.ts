export function sortByCreatedAt(a: any, b: any, desc = false) {
  return (new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()) * (desc ? -1 : 1);
}

export function sortByCreatedAtDesc(a: any, b: any) {
  return sortByCreatedAt(a, b, true);
}

export function sortBy<T>(array: T[], compareFunc: (a: T) => number, desc = false) {
  return array.sort((a, b) => {
    return (compareFunc(a) - compareFunc(b)) * (desc ? -1 : 1);
  });
}
