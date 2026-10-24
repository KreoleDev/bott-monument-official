export default {
  routes: [
    {
      method: "POST",
      path: "/private-gallery/access",
      handler: "private-gallery.access",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/private-gallery/photos/:id",
      handler: "private-gallery.photo",
      config: { auth: false },
    },
  ],
};
