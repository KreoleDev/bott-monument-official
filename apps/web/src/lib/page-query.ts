export const HOME_PAGE_QUERY = `
query HomePage($status: PublicationStatus!, $relationPage: Int!, $locale: I18NLocaleCode!) {
 pages(filters:{slug:{eq:"home"}},locale:$locale,status:$status,pagination:{limit:1}) {
 header { siteName logo { url alternativeText } links { id label href } }
 documentId title locale localizations { locale }
 seo { metaTitle metaDescription metaImage { url alternativeText } }

hero {
id
visible
eyebrow
title
description
buttonLabel
buttonHref
backgroundColor
textColor
image { url alternativeText }
video { url alternativeText }
}
footer { brand copyright tagline taglineEmphasis facebookUrl instagramUrl youtubeUrl }
 content { __typename
... on ComponentPagesContact {
id
visible
eyebrow
title
description
buttonLabel
contact { id
titleEmphasis
inquiryLabel
namePlaceholder
emailPlaceholder
messagePlaceholder
note
successMessage
phone
studio
email }
backgroundColor
textColor
}
... on ComponentPagesFeaturedIn {
id
visible
eyebrow
title
description
backgroundColor
textColor
features_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
... on ComponentPagesFounder {
id
visible
eyebrow
title
description
quote
signature
personName
personRole
image { url alternativeText }
backgroundColor
textColor
}
... on ComponentPagesGallery {
id
visible
title
description
buttonLabel
buttonHref
galleryAccess { id
eyebrow
title
emphasis
description
requestLabel
requestHref
dismissLabel }
backgroundColor
textColor
galleryItems_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
... on ComponentPagesMarquee {
id
visible
backgroundColor
textColor
items { id
label }
}
... on ComponentPagesNews {
id
visible
eyebrow
title
description
quote
buttonLabel
buttonHref
backgroundColor
textColor
pressItems_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
... on ComponentPagesShowroom {
id
visible
eyebrow
title
description
image { url alternativeText }
showroom { id
visitTitle
location
appointment
hours
statistics { id
value
label } }
buttonLabel
buttonHref
backgroundColor
textColor
}
... on ComponentPagesTestimonials {
id
visible
title
description
backgroundColor
textColor
comments_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
}
}
}`;
