export const groupBy = (list, keyGetter) => {
  const map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}

export const formatIssueCounts = (issueCounts) => {
  return issueCounts.map(row => {
    return {
      ...row,
      inserted_at: (Math.floor(new Date(row.inserted_at) / 1000))
    }
  })   
}