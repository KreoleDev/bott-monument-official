import type { Schema, Struct } from '@strapi/strapi';

export interface ContactDetails extends Struct.ComponentSchema {
  collectionName: 'components_contact_details';
  info: {
    displayName: 'details';
  };
  attributes: {
    counterText: Schema.Attribute.String;
    email: Schema.Attribute.String;
    emailPlaceholder: Schema.Attribute.String;
    inquiryLabel: Schema.Attribute.String;
    inquiryTypes: Schema.Attribute.Text;
    messagePlaceholder: Schema.Attribute.Text;
    namePlaceholder: Schema.Attribute.String;
    note: Schema.Attribute.Text;
    phone: Schema.Attribute.String;
    remainingCommissions: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    studio: Schema.Attribute.String;
    successMessage: Schema.Attribute.Text;
    titleEmphasis: Schema.Attribute.String;
    totalCommissions: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
  };
}

export interface FooterDetails extends Struct.ComponentSchema {
  collectionName: 'components_footer_details';
  info: {
    displayName: 'details';
  };
  attributes: {
    brand: Schema.Attribute.Text;
    copyright: Schema.Attribute.Text;
    tagline: Schema.Attribute.Text;
    taglineEmphasis: Schema.Attribute.Text;
  };
}

export interface GalleryAccess extends Struct.ComponentSchema {
  collectionName: 'components_gallery_access';
  info: {
    displayName: 'Gallery Access Dialog';
  };
  attributes: {
    description: Schema.Attribute.Text;
    dismissLabel: Schema.Attribute.String;
    emphasis: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    requestHref: Schema.Attribute.String;
    requestLabel: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface MarqueeItem extends Struct.ComponentSchema {
  collectionName: 'components_marquee_items';
  info: {
    displayName: 'Marquee Item';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NavigationLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_links';
  info: {
    displayName: 'Menu link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PagesContact extends Struct.ComponentSchema {
  collectionName: 'components_pages_contact';
  info: {
    displayName: 'Contact';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    contact: Schema.Attribute.Component<'contact.details', false>;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesFeaturedIn extends Struct.ComponentSchema {
  collectionName: 'components_pages_featured_in';
  info: {
    displayName: 'Featured In';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    features: Schema.Attribute.Relation<'oneToMany', 'api::feature.feature'>;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesFounder extends Struct.ComponentSchema {
  collectionName: 'components_pages_founder';
  info: {
    displayName: 'Founder';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    personName: Schema.Attribute.String;
    personRole: Schema.Attribute.String;
    quote: Schema.Attribute.Text;
    signature: Schema.Attribute.String;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesGallery extends Struct.ComponentSchema {
  collectionName: 'components_pages_gallery';
  info: {
    displayName: 'Gallery';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    buttonHref: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    galleryAccess: Schema.Attribute.Component<'gallery.access', false>;
    galleryItems: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery-item.gallery-item'
    >;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesHeader extends Struct.ComponentSchema {
  collectionName: 'components_pages_header';
  info: {
    displayName: 'Header';
  };
  attributes: {
    links: Schema.Attribute.Component<'navigation.link', true>;
    logo: Schema.Attribute.Media<'images'>;
    siteName: Schema.Attribute.String;
  };
}

export interface PagesHero extends Struct.ComponentSchema {
  collectionName: 'components_pages_hero';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    buttonHref: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
    video: Schema.Attribute.Media<'videos'>;
  };
}

export interface PagesMarquee extends Struct.ComponentSchema {
  collectionName: 'components_pages_marquee';
  info: {
    displayName: 'Marquee';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    items: Schema.Attribute.Component<'marquee.item', true>;
    textColor: Schema.Attribute.String;
  };
}

export interface PagesNews extends Struct.ComponentSchema {
  collectionName: 'components_pages_news';
  info: {
    displayName: 'News';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    buttonHref: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    pressItems: Schema.Attribute.Relation<
      'oneToMany',
      'api::press-item.press-item'
    >;
    quote: Schema.Attribute.Text;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesShowroom extends Struct.ComponentSchema {
  collectionName: 'components_pages_showroom';
  info: {
    displayName: 'Showroom';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    buttonHref: Schema.Attribute.String;
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    showroom: Schema.Attribute.Component<'showroom.details', false>;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PagesTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_pages_testimonials';
  info: {
    displayName: 'Testimonials';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    comments: Schema.Attribute.Relation<'oneToMany', 'api::comment.comment'>;
    description: Schema.Attribute.Text;
    textColor: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo';
  info: {
    displayName: 'Page SEO';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Statistic';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ShowroomDetails extends Struct.ComponentSchema {
  collectionName: 'components_showroom_details';
  info: {
    displayName: 'Showroom Details';
  };
  attributes: {
    appointment: Schema.Attribute.String;
    hours: Schema.Attribute.Text;
    location: Schema.Attribute.String;
    statistics: Schema.Attribute.Component<'shared.stat', true>;
    visitTitle: Schema.Attribute.String;
  };
}

export interface ThemeHeaderScroll extends Struct.ComponentSchema {
  collectionName: 'components_theme_header_scroll';
  info: {
    description: 'Add a rule per section. The first enabled matching rule wins; other sections use the normal header colors.';
    displayName: 'Header Color Rule';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#0A0A0A'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    section: Schema.Attribute.Enumeration<
      [
        'hero',
        'marqueeStrip',
        'founder',
        'work',
        'press-clippings',
        'gallery',
        'showroom',
        'testimonials',
        'contact',
        'footer',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'work'>;
    textColor: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#F5F5F0'>;
  };
}

export interface ThemeSectionColors extends Struct.ComponentSchema {
  collectionName: 'components_theme_section_colors';
  info: {
    description: 'Optional #RRGGBB colors. Empty fields retain the original design. End/middle colors create a gradient; overlay is the showroom photo shade. Surface colors control cards and dialogs; button colors control actions.';
    displayName: 'Section Colors';
  };
  attributes: {
    accentColor: Schema.Attribute.String;
    avatarColor: Schema.Attribute.String;
    backgroundColor: Schema.Attribute.String;
    backgroundEndColor: Schema.Attribute.String;
    backgroundMiddleColor: Schema.Attribute.String;
    borderColor: Schema.Attribute.String;
    buttonColor: Schema.Attribute.String;
    buttonTextColor: Schema.Attribute.String;
    gradientAngle: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 360;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<120>;
    mutedTextColor: Schema.Attribute.String;
    overlayColor: Schema.Attribute.String;
    surfaceColor: Schema.Attribute.String;
    surfaceTextColor: Schema.Attribute.String;
    textColor: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'contact.details': ContactDetails;
      'footer.details': FooterDetails;
      'gallery.access': GalleryAccess;
      'marquee.item': MarqueeItem;
      'navigation.link': NavigationLink;
      'pages.contact': PagesContact;
      'pages.featured-in': PagesFeaturedIn;
      'pages.founder': PagesFounder;
      'pages.gallery': PagesGallery;
      'pages.header': PagesHeader;
      'pages.hero': PagesHero;
      'pages.marquee': PagesMarquee;
      'pages.news': PagesNews;
      'pages.showroom': PagesShowroom;
      'pages.testimonials': PagesTestimonials;
      'shared.seo': SharedSeo;
      'shared.stat': SharedStat;
      'showroom.details': ShowroomDetails;
      'theme.header-scroll': ThemeHeaderScroll;
      'theme.section-colors': ThemeSectionColors;
    }
  }
}
