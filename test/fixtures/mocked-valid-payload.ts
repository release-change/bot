export const mockedValidPayload = {
  ref: "refs/heads/main",
  before: "0123456789abcdef",
  after: "0000000000000000",
  repository: {
    id: 123456789,
    node_id: "fake-ID",
    name: "repo",
    full_name: "owner/repo"
  },
  sender: { login: "release-change[bot]" },
  installation: {
    id: 123,
    node_id: "fake-node-id"
  }
};
