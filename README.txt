


Structure:

DEV_NOTES - Observations or thoughts related to the project
INTERNAL_NOTES - Similar to DEV_NOTES

scripts
    ├─── common (common functions and libraries [ethereumjs-..., etc.])
    ├─── core (Mew Core Container Class, primarily used as an instance factory)
    ├─── errors (nothing really right now)
    ├─── provider (MewEngine [based on provier-engine])
    │       ├─ modules (contains providers or wrappers)
    │       └─ mewEngine (the provider-engine based implementation)
    └─── wallets

test
  ├─── completedTests (finished tests that are known to (or have) worked)
  ├─── demoRuns (demo setups that differ from a test primarily as they are not in a test setup.  Trying things out, and such
  ├─── fixtures (test specific mocks or stubs )
  └─── withGnache (probably broken, but tests that actually interact with a node to get values such as blockNumber, transactionCount)

