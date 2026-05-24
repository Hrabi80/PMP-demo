export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  profile: "/profile",
  accessDenied: "/access-denied",

  admin: {
    dashboard: "/admin",
    specialities: "/admin/specialities",
    classLevels: "/admin/class-levels",
  },

  professor: {
    dashboard: "/professor",
    newQcm: "/professor/qcms/new",
    editQcm: (id: string) => `/professor/qcms/${id}/edit`,
  },

  qcm: {
    browse: "/qcm",
    take: (id: string) => `/qcm/${id}`,
    result: (id: string) => `/qcm/${id}/result`,
  },
}
