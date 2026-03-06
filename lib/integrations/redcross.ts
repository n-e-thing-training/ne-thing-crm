export async function searchCertificate(query: string) {
  void query;
  return { matched: false, source: "stub" };
}

export async function matchParticipant(firstName: string, lastName: string, email: string | null) {
  void firstName;
  void lastName;
  void email;
  return { matched: false, source: "stub" };
}
