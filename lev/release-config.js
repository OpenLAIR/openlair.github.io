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
    url: "https://huggingface.co/collections/songdj/lev",
    status: "Planned",
    hint: "Private research collection. Dataset publication is forthcoming; the collection currently contains models only.",
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
