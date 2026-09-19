export const HOME_PAGE_QUERY = `
query HomePage($status: PublicationStatus!, $relationPage: Int!) {
 pages(filters:{slug:{eq:"home"}},locale:"en",status:$status,pagination:{limit:1}) {
 header { siteName logo { url alternativeText } links { id label href } }
 documentId title seo { metaTitle metaDescription metaImage { url alternativeText } }

hero {
id
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
footer { brand copyright tagline taglineEmphasis }
 content { __typename
... on ComponentPagesContact {
id
eyebrow
title
description
buttonLabel
contact { id
titleEmphasis
counterText
inquiryLabel
inquiryTypes
namePlaceholder
emailPlaceholder
messagePlaceholder
note
successMessage
phone
studio
email
totalCommissions
remainingCommissions }
backgroundColor
textColor
}
... on ComponentPagesFeaturedIn {
id
eyebrow
title
description
backgroundColor
textColor
features_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
... on ComponentPagesFounder {
id
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
backgroundColor
textColor
items { id
label }
}
... on ComponentPagesNews {
id
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
title
description
backgroundColor
textColor
comments_connection(pagination:{page:$relationPage,pageSize:100}) { nodes { documentId }  }
}
}
}
}`;
