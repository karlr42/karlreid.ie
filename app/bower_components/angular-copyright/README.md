An Angular directive for generating copyright notices(for footers, etc.).


Takes the form 
`<copyright> © <start year>[-end year]. <message>`

Example plunkr: http://plnkr.co/edit/zAJrBd?p=preview

### Installation

Either just download the directive file, copy and paste its contents, or issue 
`bower install karlr42/angular-copyright`

### Attributes:
 - **start** : the year the copyright begins. If not set, defaults to the current year
 - **localised-copyright** : a string for the word 'Copyright'.
 - **message** : the message after the years (e.g 'All Rights Reserved.')
 - **norange** : if the start date is in the past, only show it, do not show "startYear-currentYear"


Many thanks to http://briantford.com/blog/angular-bower for info on how to set this project up.
