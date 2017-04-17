# Custom Theming in Ilios

Due to the fact that Ilios v3 client code is now served to users from Amazon S3 servers in "the cloud", customizing the frontend Ilios GUI client has proven to be a bit more difficult than it was in previous versions of Ilios. Schools using Ilios can no longer manage changes to the frontend code, so changing the colors or customizing the 'theme' of Ilios, in its current iteration, seems like it should be impossible!

Well, we're here to tell you that customizing colors within Ilios IS possible and, with just a few additions/changes to your backend codebase, you can customize the header color and logo of your Ilios instance fairly easily!

While the Ilios Project team is working on a way to more easily accomplish theme changes within the Ilios interface directly, we've provided a workaround for users who manage their own Ilios 3 API backend server and would like to change a few details of the look and feel of their site to more appropriately reflect the theme/branding of their respective institution.

The following steps specifically outline the process for changing the color of the main header and the Ilios logo graphic to something else, but other themed attributes of Ilios can also be changed using this same method.

## BEFORE YOU BEGIN

For this excercise, you will need to know what color you would like your main header "banner" to be and you will need a custom logo graphic sized the same as the default Ilios logo graphic.  You should also be somewhat familiar with CSS, but it's not super important if you are just following these instructions to update the banner color and its logo.

#### The Main Header Color

By default, the header that spans the top of every screen in Ilios has a background-color attribute that we on the Ilios team refer to as 'ilios-orange' or '#cc6600' (in hexadecimal).

#### The Main Header Logo Graphic

Currently, the[default Ilios logo](https://github.com/ilios/ilios/tree/master/web/school-theming/images/ilios-logo.png), as it is served from Amazon S3, is 42px wide and 84px tall and the source file can be found at [https://github.com/ilios/frontend/blob/master/public/assets/images/ilios-logo.png](https://github.com/ilios/frontend/blob/master/public/assets/images/ilios-logo.png).  If you would like to use your own institution's logo instead, you will want to create/use a logo image with the same height and width as the default Ilios logo.  You can customize the size of the logo later if you like but, for the sake of easily understanding how this process works, you should leave it the same size for now.

Once you have the logo you would like to use, you will want to copy it to your Ilios 3 API backend server into the ['web/school-theming/images'](https://github.com/ilios/ilios/tree/master/web/school-theming/images) subfolder of the Ilios application.  If you rename your logo file to match the default (ilios-logo.png) and then overwrite the original with the new file directly, that's all you will need to do to have your new logo start showing up once you refresh your Ilios browser session.

If you would prefer to not change the filename of your logo image, you'll need to update the filename in the [school.css](https://github.com/ilios/ilios/tree/master/web/school-theming/css/school.css) stylesheet to specify the different filename.

### Changing the color and logo of the main header

In addition to changing the logo in the header of the Ilios application, you may want to change the color of the header banner as well.

To do this, just change value of the header's 'background-color' attribute in the ['school.css'](https://github.com/ilios/ilios/tree/master/web/school-theming/css/school.css) theme style override file.

To change the header color, find the line that reads:

```background-color: #cc6600;```

and explicitly change the '#cc6600' value to the desired new hexadecimal color (eg, '#54bfe2'). After making the change, the line should now look like this:

```background-color: #54bfe2;```

To point the logo graphic source to the one with the new filename, make sure you have uploaded your new file (eg, 'new_file.png') to the '/school-theming/images/' on your API server and then find the line in 'school.css' that reads:

```background-image: url('/school-theming/images/ilios-logo.png');```

and change it so that it should now includes the absolute URL of the new logo (as determined above):

```background-image: url('/school-theming/new_file.png');```

Once you make these changes and save the file on the API server, refreshing your application frontend should automatically reflect the new changes.