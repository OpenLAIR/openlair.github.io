// linked controls navigation; available means verified public access. A private
// destination may be linked without claiming that its contents are public.
// Only set available after checking the exact URL while signed out.
window.LEV_RELEASE = {
  paper: {
    linked: true,
    available: false,
    visibility: "pending",
    url: "#paper",
    status: "Forthcoming",
    hint: "arXiv identifier forthcoming. View paper status on this page.",
  },
  code: {
    linked: true,
    available: false,
    visibility: "private",
    url: "https://github.com/OpenLAIR/lev",
    status: "Private",
    hint: "Private GitHub repository. Access requires an authorized account.",
  },
  models: {
    linked: true,
    available: false,
    visibility: "private",
    url: "https://huggingface.co/collections/songdj/lev",
    status: "Private",
    hint: "Private Hugging Face collection containing Lev-1.4B, Lev-2.6B, and Lev-3B.",
  },
  data: {
    linked: true,
    available: false,
    visibility: "private",
    url: "#datasets",
    status: "Private",
    hint: "Three private dataset repositories. Benchmark and training downloads contain subsets filtered by source redistribution terms; full original data requires lawful local acquisition.",
  },
  benchmark: {
    linked: true,
    available: false,
    visibility: "private",
    url: "https://huggingface.co/datasets/songdj/LevBench",
    status: "Private",
    hint: "Private LevBench subset and reconstruction materials. Excluded original sources must be obtained lawfully under their own terms.",
  },
  training: {
    linked: true,
    available: false,
    visibility: "private",
    url: "https://huggingface.co/datasets/songdj/Lev-train-v2",
    status: "Private",
    hint: "Private training subset and recipes. The full original training mixture is not included; remaining sources require lawful local acquisition.",
  },
  results: {
    linked: true,
    available: false,
    visibility: "private",
    url: "https://huggingface.co/datasets/songdj/Lev-results",
    status: "Private",
    hint: "Private results and reproduction materials without source question or training-example text.",
  },
  demo: {
    linked: false,
    available: false,
    visibility: "pending",
    url: null,
    status: "Upcoming",
    hint: "Live model demo planned for a later release.",
  },
};
