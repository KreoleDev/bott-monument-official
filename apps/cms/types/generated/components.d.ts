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
    description: 'Override header colors while the selected section crosses 35% of the viewport. Disable to keep normal palette colors.';
    displayName: 'Header Scroll';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#0A0A0A'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    section: Schema.Attribute.Enumeration<
      [
        'work',
        'hero',
        'founder',
        'press-clippings',
        'magazine',
        'showroom',
        'testimonials',
        'contact',
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
      'shared.stat': SharedStat;
      'showroom.details': ShowroomDetails;
      'theme.header-scroll': ThemeHeaderScroll;
      'theme.section-colors': ThemeSectionColors;
    }
  }
}
