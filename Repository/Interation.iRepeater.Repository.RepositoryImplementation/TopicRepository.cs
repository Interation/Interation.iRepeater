using System;
using System.Collections.Generic;
using System.Linq;
using Interation.iRepeater.Repository.Entity;
using Interation.iRepeater.Repository.IRepositoryProvider;

namespace Interation.iRepeater.Repository.RepositoryImplementation
{
    public class TopicRepository : ITopicRepository
    {
        public List<Topic> GetCurrentTopics()
        {
            using (var db = new iRepeaterDbContext())
            {
                return db.Proc_SelectCurrentTopics().ToList();
            }
        }
    }
}
