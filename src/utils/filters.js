/**
 * Filter an array of issues by the given criteria.
 *
 * @param {Array}  issues
 * @param {Object} filters  { category, urgency, status, state, query }
 */
export const filterIssues = (issues, { category, urgency, status, state, query } = {}) => {
  return issues.filter((issue) => {
    if (category && category !== 'All' && issue.category !== category) return false;
    if (urgency  && urgency  !== 'All' && issue.urgency  !== urgency)  return false;
    if (state    && state    !== 'All' && issue.state    !== state)    return false;

    if (status === 'Solved' && !issue.solved) return false;
    if (status === 'Open'   &&  issue.solved) return false;

    if (query) {
      const q = query.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc  = issue.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });
};

/**
 * Sort an array of issues by the given sort key.
 *
 * @param {Array}  issues
 * @param {string} sortKey  'recent' | 'upvotes' | 'responses'
 */
export const sortIssues = (issues, sortKey = 'recent') => {
  const copy = [...issues];
  switch (sortKey) {
    case 'upvotes':   return copy.sort((a, b) => b.upvotes   - a.upvotes);
    case 'responses': return copy.sort((a, b) => b.responses - a.responses);
    case 'recent':
    default:
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};
