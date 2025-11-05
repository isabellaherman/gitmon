// Easy-to-edit adoption data
// To add a new adoption, just add an entry with the monster name as key
// To remove an adoption, just delete or comment out the entry

export const adoptionData = {
  "Infernus": {
    sponsorName: "REAL OFICIAL",
    sponsorUrl: "https://realoficial.com.br/?utm_source=GITMON"
  },
  // "Volterra": {
  //   sponsorName: "Your Company Name",
  //   sponsorUrl: "https://yourcompany.com/?utm_source=GITMON"
  // },

  // "Spectra": {
  //   sponsorName: "Another Sponsor",
  //   sponsorUrl: "https://anothersponsor.com/?utm_source=GITMON"
  // },
};

// Helper function to get adoption data for a monster
export const getAdoptionData = (monsterName: string) => {
  return adoptionData[monsterName as keyof typeof adoptionData];
};