const { database } = require('firebase-admin');
const admin = require('firebase-admin');
async function migrate(from, to, tenantId){
    const app1 = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    const app2 = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    }, to);
    const dbFrom = app1.firestore();
    dbFrom.settings({
        databaseId: from
        });
    const dbTo = app2.firestore();
    dbTo.settings({
        databaseId: to
        });


    //Get All Data from the old db
    allOldData = []
    await dbFrom.listCollections().then(collections => {
        collections.forEach(collection => {
            collection.where('tenantId', '==', tenantId).get().then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    console.log(collection.id, data);
                    //Write data to the new collection
                    dbTo.collection(collection.id).add(data).then(ref => {
                        console.log('Added document with ID to database:',dbTo.databaseId,collection.id, ref.id);
                    }).then(() => {
                    doc.ref.delete().then(ref => {
                        console.log('Deleted document with ID from database:',dbFrom.databaseId,collection.id, ref.id);
                    })
                })
                });

            });
        });
    })

    console.log("All Done!")
}

migrate('parking','free', 'wegmachen-ij57r')