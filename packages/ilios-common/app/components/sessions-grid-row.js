
  // Getter for prerequisite session titles
  get prerequisiteTitles() {
    const prerequisites = this.args.session?.prerequisites || [];
    if (prerequisites.length === 0) {
      return null;
    }
    
    const titles = prerequisites.map(prereq => prereq.title).filter(Boolean);
    return titles.length > 0 ? titles.join(', ') : null;
  }
}
