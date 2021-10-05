# Runn Sync Project

This project was created because our company wanted a sync algorithm, that is more sophisticated than existing solutions.

## Requirements

Every sync works by connecting people from every platform with their email addresses.
A matching email adress of all persons on all platforms is therefore mandatory in order for the sync to work.

## Personio -> Runn sync (leave times)

We use [personio](https://www.personio.de) as our HR tool. One part of the sync is there to sync absences from personio to runn.

Currently, the algorithm deletes all existing leave times but only until the runn API will allow to "overwrite" existing leave times.
This has the caveat, that all manually added leave times are deleted every time the sync runs. 
It is however very easy to change that behavior by just removing the method that cleans out existing runn leave times.

## Harvest -> Runn sync (time tracking entries)

Our time tracking software currently is [harvest](https://www.getharvest.com). 
We had a lot of existing time projects and wanted an integration, that just combines every time entry into actuals and saves it to runn.

The harvest to runn integration has the special requirement, that additionally to having people with matching emails, you need to add all runn-projects' ids into the harvest "code" field.
The code field is used to create a combination between runn and harvest projects, as it is possible to have multiple harvest projects that track to one single runn project.

The handling of runn phases is not handled 100% perfect (yet), as we rely on runn's automatic phase assignment.
This works as long as there was no automatic 0 fill in, as (currently - might change in the future) when runn adds 0 fill in entries, they do not have any phase attached to them.
When overwriting thos 0 actuals via the API, the phase assignment does not work, as there is already a 0 actual without a phase, so it just uses that and just overwrites the actual's time. 

It is also recommended, that you turn on the automatic 0 fill in every sunday.

### Why didn't you use the existing harvest runn sync solution?

We could not use the existing solution, as it does not allow syncing (runn) 1:n (harvest) project relations.

## Possible usage

We have this set up where we build a docker image with the api and deploy it to google cloud run. 
We also have a cloud schedule that triggers the sync regularly.
