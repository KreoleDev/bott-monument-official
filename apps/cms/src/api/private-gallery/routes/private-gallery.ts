export default {
  routes: [
    {
      method: "POST",
      path: "/private-gallery/access",
      handler: "private-gallery.access",
      config: { auth: false },
    },
  ],
};
