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

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'contact.details': ContactDetails;
      'footer.details': FooterDetails;
      'gallery.access': GalleryAccess;
      'shared.stat': SharedStat;
      'showroom.details': ShowroomDetails;
    }
  }
}
