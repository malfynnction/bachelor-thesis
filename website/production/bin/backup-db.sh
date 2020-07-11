BASE_DIR="/home/adminuser"
BACKUP_DIR="${BASE_DIR}/db-backups"
STORAGE_LENGTH=14

DATE=`date +%Y-%m-%d`
FILENAME="db-backup_${DATE}.tar"
tar -cf "${BACKUP_DIR}/${FILENAME}" -C "${BASE_DIR}/production/couchdb/data/" .
# extract using `tar -xf $BACKUP_DIR/$FILENAME -C $BASE_DIR/production/couchdb/data/`

# TODO: store backup somewhere else (where?)

# delete files older than $STORAGE_LENGTH days
find $BACKUP_DIR -type f -mtime +$STORAGE_LENGTH -exec rm -f {} \;
