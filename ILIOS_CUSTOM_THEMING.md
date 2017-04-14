# Custom Theming in Ilios

Due to the fact that Ilios v3 client code is now served to users from Amazon S3 servers in "the cloud", customizing the frontend Ilios GUI client has proven to be a bit more difficult than it was in previous versions. Schools using Ilios can no longer manage changes to the frontend code, so changing the colors or customizing the 'theme' of Ilios, in its current iteration, seems like it should be impossible!

Well, we're here to tell you that customizing colors within Ilios IS possible and, with just a few tweaks to your code before re-building the application, you can customize your Ilios instance fairly easily!

While the Ilios Project team is working on a way to more easily accomplish theme changes within the Ilios interface directly, we're providing the following workaround for users who would like to change a few details of the look and feel of their site to more appropriately reflect the theme/branding of their respective institution.

The following steps outline the process for changing the color of the main banner and the Ilios logo graphic to something else, but other themed attributes of Ilios can also be changed using this same method.

## BEFORE YOU BEGIN

For this excercise, you will need to know what color you would like your main banner to be and you will need a custom logo graphic sized similarly to the default Ilios logo graphic.  You should also be somewhat familiar with CSS/SASS, but it's not super important if you are just following these instructions to update the banner color and its logo.

#### The Main Banner Color

By default, the banner that spans the top of every screen in Ilios has a background-color attribute that we on the Ilios team refer to as 'ilios-orange' or '#cc6600' in the hexadecimal.  For the purpose of this excercise, we are going to change the value of 'ilios-orange' to a something more of a light blue; to do so, we will use the color with hexadecimal value '#54bfe2'.

In this example, we will target all occurences of the 'ilios-orange' color and change it to match this value.  This means that, besides the banner color, all orange text in the application will also change to blue.  You can also target just the banner-color specifically, and leave the text as-is, and we will cover both of these options in this lesson. 

#### The Ilios Logo Graphic

Currently, the[default Ilios logo](https://d26vzvixg52o0d.cloudfront.net/assets/images/ilios-logo-18c065a2aee6f0450d0304c2a5e39e0c.png), as it is served from Amazon S3, is 42px wide and 84px tall and the source file can be found at [https://github.com/ilios/frontend/blob/master/public/assets/images/ilios-logo.png](https://github.com/ilios/frontend/blob/master/public/assets/images/ilios-logo.png).  If you would like to use your own institution's logo instead, you will probably want to create/use one similar in height and width as the default Ilios logo, but you can try out different sizes to see which one best fits your needs.

Once you have the logo you would like to use, you will want to serve it as a resource on a webserver.  Ideally, this should be the same webserver from which you serve the Ilios API backend, as serving it from a host other than your API server may cause security notices to show up in your browser and/or prevent its download.  Furthermore, the protocol on the server hosting the graphic should match the protocol of Ilios instance itself; as we recommend that ALL Ilios instances run on https-enabled servers only, this mean that the url for accessing the logo image should begin with 'https' as well!

Once you have the logo being served and accessible, note its complete URL.  For this example, we have copied the file to the 'application/web/' subfolder within the Ilios application directory on the API webserver and we will use the url [https://ilios3-demo.ucsf.edu/images/ucsf_logo_white_on_transp.png](https://ilios3-demo.ucsf.edu/images/ucsf_logo_white_on_transp.png) to access it from the web.

IMPORTANT: Putting the new image in the 'application/web' directory on the API server ensures that it will be requested from the same host and via the same protocol as the API, so your browser should not throw any security warnings when attempting to display it.

## Changing the colors

Once you have your desired logo uploaded and being served from a public URL, it is time to change the styles that will update the logo and change the colors.

To do this, open the following 'SASS' (.scss) files from the approprate location under the 'app/styles' subfolder of your Ilios Application folder:

* app/styles/_variables.scss - this file lets you set the globally-applied color value of the '$ilios-orange' variable
* app/styles/mixins/header.scss - this is the file where we can change set the url for the new logo image and set the banner color specifically 

### Changing the logo and banner color only

In order to change just the logo and banner color, you only need to open the 'app/styles/mixins/header.scss' and change two lines.

To change the banner color, find the line that reads:

```background-color: $ilios-orange;```

and explicitly change the '$ilios-orange' variable to the desired hexadecimal color that we selected above (#54bfe2). After making the change, the line should now look like this:

```background-color: #54bfe2;```

To change the logo graphic, find the line that reads:

```background-image: url('images/ilios-logo.png');```

and change it so that it should now includes the absolute URL of the new logo (as determined above):

```background-image: url('https://ilios3-demo.ucsf.edu/images/ucsf_logo_white_on_transp.png');```

Once you make these changes, save the 'app/styles/mixins/header.scss' file, clear cache, and rebuild Ilios using the 'composer install' command as outlined in the process at https://github.com/ilios/ilios/blob/master/INSTALL.md

### Changing the 'ilios-orange' color globally

In order to change ALL occurrences of the 'ilios-orange' color in Ilios, including in the banner and in the text of the application, you just need to change one variable in the app/styles/_variables.scss file.  Open the file and find the following line:

```$ilios-orange: #c60;```

And change its value to match the new desired color:

```$ilios-orange: #54bfe2;```